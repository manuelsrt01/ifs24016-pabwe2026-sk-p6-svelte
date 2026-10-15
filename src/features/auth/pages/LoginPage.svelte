<script>
  import { useInput } from "../../../hooks/useInput.js";
  import { login, authLoading } from "../states/authStore.js";
  import { showErrorDialog, isValidEmail } from "../../../helpers/toolsHelper.js";
  import { navigate, handleLinkClick } from "../../../router.js";
  import { inputClass, labelClass, primaryButton } from "../../../helpers/styles.js";

  const { value: email } = useInput("");
  const { value: password } = useInput("");
  let errorText = $state("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!$email.trim() || !$password) {
      errorText = "Email dan kata sandi wajib diisi.";
      return;
    }
    if (!isValidEmail($email.trim())) {
      errorText = "Format email tidak valid.";
      return;
    }
    errorText = "";

    const result = await login({ email: $email.trim(), password: $password });
    if (result.ok) {
      navigate("/", { replace: true });
    } else {
      await showErrorDialog(result.message);
    }
  }
</script>

<h1 class="text-2xl font-extrabold text-slate-900">Masuk</h1>
<p class="mb-6 mt-1 text-sm text-slate-500">Masuk untuk mengelola Link Tree Anda.</p>

<form class="space-y-4" onsubmit={handleSubmit} novalidate>
  <div>
    <label class={labelClass} for="login-email">Email</label>
    <input id="login-email" type="email" autocomplete="email" class={inputClass} bind:value={$email} />
  </div>
  <div>
    <label class={labelClass} for="login-password">Kata sandi</label>
    <input id="login-password" type="password" autocomplete="current-password" class={inputClass} bind:value={$password} />
  </div>

  {#if errorText}
    <p class="text-sm text-rose-600" role="alert">{errorText}</p>
  {/if}

  <button type="submit" class={`${primaryButton} w-full`} disabled={$authLoading}>
    {$authLoading ? "Memproses..." : "Masuk"}
  </button>
</form>

<p class="mt-6 text-center text-sm text-slate-500">
  Belum punya akun?
  <a href="/auth/register" class="font-semibold text-indigo-600" onclick={(e) => handleLinkClick(e, "/auth/register")}>Daftar</a>
</p>
