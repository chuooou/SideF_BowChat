import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { authEndpoints } from "../../api/endpoints";
import { SectionHeader } from "../../components/SectionHeader";
import { useAuthStore } from "../../store/authStore";

interface LoginFormValues {
  email: string;
  password: string;
}

interface SignupFormValues extends LoginFormValues {
  nickName: string;
}

export function AuthPanel() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const queryClient = useQueryClient();
  const { accessToken, user, setSession, clearSession } = useAuthStore();
  const loginForm = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
  });
  const signupForm = useForm<SignupFormValues>({
    defaultValues: { email: "", password: "", nickName: "" },
  });

  useQuery({
    queryKey: ["auth", "me", accessToken],
    queryFn: authEndpoints.me,
    enabled: Boolean(accessToken),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: authEndpoints.login,
    onSuccess: (data) => {
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.userInfo,
      });
      queryClient.invalidateQueries();
    },
  });

  const signupMutation = useMutation({
    mutationFn: authEndpoints.signup,
    onSuccess: (_, values) => {
      setMode("login");
      loginForm.reset({ email: values.email, password: values.password });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authEndpoints.logout,
    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });

  return (
    <section className="panel p-4">
      <SectionHeader
        title="계정"
        description={user ? `${user.nickname} 님` : ""}
        action={
          user ? (
            <button className="btn-muted" onClick={() => logoutMutation.mutate()} title="로그아웃">
              <LogOut size={16} />
              로그아웃
            </button>
          ) : null
        }
      />

      {!user ? (
        <div>
          <div className="mb-4 grid grid-cols-2 rounded-md border border-line bg-slate-50 p-1">
            <button
              className={`h-9 rounded text-sm font-semibold ${mode === "login" ? "bg-white shadow-sm" : "text-slate-500"}`}
              onClick={() => setMode("login")}
            >
              로그인
            </button>
            <button
              className={`h-9 rounded text-sm font-semibold ${mode === "signup" ? "bg-white shadow-sm" : "text-slate-500"}`}
              onClick={() => setMode("signup")}
            >
              회원가입
            </button>
          </div>

          {mode === "login" ? (
            <form className="space-y-3" onSubmit={loginForm.handleSubmit((values) => loginMutation.mutate(values))}>
              <Field label="이메일" type="email" registration={loginForm.register("email", { required: true })} />
              <Field
                label="비밀번호"
                type="password"
                registration={loginForm.register("password", {
                  required: true,
                })}
              />
              <button className="btn-primary w-full" disabled={loginMutation.isPending} title="로그인">
                <LogIn size={16} />
                로그인
              </button>
              {loginMutation.isError ? <ErrorText message="로그인에 실패했습니다." /> : null}
            </form>
          ) : (
            <form className="space-y-3" onSubmit={signupForm.handleSubmit((values) => signupMutation.mutate(values))}>
              <Field
                label="닉네임"
                registration={signupForm.register("nickName", {
                  required: true,
                })}
              />
              <Field label="이메일" type="email" registration={signupForm.register("email", { required: true })} />
              <Field
                label="비밀번호"
                type="password"
                registration={signupForm.register("password", {
                  required: true,
                })}
              />
              <button className="btn-primary w-full" disabled={signupMutation.isPending} title="회원가입">
                <UserPlus size={16} />
                회원가입
              </button>
              {signupMutation.isSuccess ? <p className="text-sm text-emerald-700">가입 완료. 로그인할 수 있습니다.</p> : null}
              {signupMutation.isError ? <ErrorText message="회원가입에 실패했습니다." /> : null}
            </form>
          )}
        </div>
      ) : (
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <Info label="ID" value={String(user.id ?? user.userId ?? "-")} />
          <Info label="이메일" value={user.email} />
          <Info label="제공자" value={user.provider ?? user.role ?? "LOCAL"} />
        </dl>
      )}
    </section>
  );
}

function Field({
  label,
  type = "text",
  registration,
}: {
  label: string;
  type?: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <label>
      <span className="label">{label}</span>
      <input className="input" type={type} {...registration} />
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-field p-3">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 truncate font-semibold text-ink">{value}</dd>
    </div>
  );
}

function ErrorText({ message }: { message: string }) {
  return <p className="text-sm font-semibold text-red-600">{message}</p>;
}
