<script>
  import { useInput } from "../../../hooks/useInput.js";
  import { register, authLoading } from "../states/authStore.js";
  import { showErrorDialog, showSuccessDialog, isValidEmail } from "../../../helpers/toolsHelper.js";
  import { navigate, handleLinkClick } from "../../../router.js";
  import { inputClass, labelClass, primaryButton } from "../../../helpers/styles.js";

  const { value: name } = useInput("");
  const { value: email } = useInput("");
  const { value: password } = useInput("");
  const { value: confirmation } = useInput("");
  let errorText = $state("");

  function validate() {
    if (!$name.trim() || !$email.trim() || !$password || !$confirmation) {
      return "Semua kolom wajib diisi.";
    }
    if (!isValidEmail($email.trim())) return "Format email tidak valid.";
    if ($password.length < 6) return "Kata sandi minimal 6 karakter.";
    if ($password !== $confirmation) return "Konfirmasi kata sandi tidak sama.";
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    errorText = validate();
    if (errorText) return;

    const result = await register({ name: $name.trim(), email: $email.trim(), password: $password });
    if (result.ok) {
      await showSuccessDialog(result.message);
      navigate("/auth/login");
    } else {
      await showErrorDialog(result.message);
    }
  }
</script>

<h1 class="text-2xl font-extrabold text-slate-900">Daftar</h1>
<p class="mb-6 mt-1 text-sm text-slate-500">Buat akun untuk mulai membuat Link Tree.</p>

<form class="space-y-4" onsubmit={handleSubmit} novalidate>
  <div>
    <label class={labelClass} for="register-name">Nama</label>
    <input id="register-name" type="text" autocomplete="name" class={inputClass} bind:value={$name} />
  </div>
  <div>
    <label class={labelClass} for="register-email">Email</label>
    <input id="register-email" type="email" autocomplete="email" class={inputClass} bind:value={$email} />
  </div>
  <div>
    <label class={labelClass} for="register-password">Kata sandi</label>
    <input id="register-password" type="password" autocomplete="new-password" class={inputClass} bind:value={$password} />
  </div>
  <div>
    <label class={labelClass} for="register-confirmation">Konfirmasi kata sandi</label>
    <input id="register-confirmation" type="password" autocomplete="new-password" class={inputClass} bind:value={$confirmation} />
  </div>

  {#if errorText}
    <p class="text-sm text-rose-600" role="alert">{errorText}</p>
  {/if}

  <button type="submit" class={`${primaryButton} w-full`} disabled={$authLoading}>
    {$authLoading ? "Memproses..." : "Daftar"}
  </button>
</form>

<p class="mt-6 text-center text-sm text-slate-500">
  Sudah punya akun?
  <a href="/auth/login" class="font-semibold text-indigo-600" onclick={(e) => handleLinkClick(e, "/auth/login")}>Masuk</a>
</p>
