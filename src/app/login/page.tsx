import { LoginForm } from "@/components/auth/login-form";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-[20px] bg-card p-8 shadow-(--shadow-card)">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-primary text-base font-semibold text-primary-foreground shadow-(--shadow-brand)">
            <span className="-mt-px">G</span>
          </div>
          <div>
            <p className="text-[17px] font-semibold tracking-tight">
              {APP_NAME}
            </p>
            <p className="text-sm text-muted-foreground">
              Ingresá con tu cuenta para continuar
            </p>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
