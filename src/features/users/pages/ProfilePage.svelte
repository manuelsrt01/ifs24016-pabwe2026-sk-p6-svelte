<script>
  import { useInput } from "../../../hooks/useInput.js";
  import { profile } from "../../auth/states/authStore.js";
  import {
    updateProfile,
    uploadPhoto,
    changePassword,
    isUpdatingProfile,
    isUploadingPhoto,
    isChangingPassword,
  } from "../states/usersStore.js";
  import { toAbsoluteUrl, DEFAULT_PHOTO_PATH } from "../../../helpers/apiHelper.js";
  import { showSuccessDialog, showErrorDialog, isValidEmail } from "../../../helpers/toolsHelper.js";
  import { inputClass, labelClass, primaryButton, cardClass } from "../../../helpers/styles.js";

  const { value: name } = useInput("");
  const { value: email } = useInput("");
  const { value: password, reset: resetPassword } = useInput("");
  const { value: newPassword, reset: resetNewPassword } = useInput("");
  const { value: confirmation, reset: resetConfirmation } = useInput("");

  let photoFile = $state(null);
  let profileError = $state("");
  let photoError = $state("");
  let passwordError = $state("");

  $effect(() => {
    if ($profile) {
      name.set($profile.name);
      email.set($profile.email);
    }
  });

  async function report(result) {
    if (result.ok) {
      await showSuccessDialog(result.message);
    } else {
      await showErrorDialog(result.message);
    }
    return result.ok;
  }

  async function handleSaveProfile(event) {
    event.preventDefault();
    if (!$name.trim() || !$email.trim()) {
      profileError = "Nama dan email wajib diisi.";
      return;
    }
    if (!isValidEmail($email.trim())) {
      profileError = "Format email tidak valid.";
      return;
    }
    profileError = "";
    await report(await updateProfile({ name: $name.trim(), email: $email.trim() }));
  }

  async function handleUploadPhoto(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!photoFile) {
      photoError = "Pilih foto terlebih dahulu.";
      return;
    }
    if (!photoFile.type.startsWith("image/")) {
      photoError = "Berkas harus berupa gambar.";
      return;
    }
    photoError = "";
    if (await report(await uploadPhoto(photoFile))) {
      photoFile = null;
      form.reset();
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    if (!$password || !$newPassword || !$confirmation) {
      passwordError = "Semua kolom kata sandi wajib diisi.";
      return;
    }
    if ($newPassword.length < 6) {
      passwordError = "Kata sandi baru minimal 6 karakter.";
      return;
    }
    if ($newPassword !== $confirmation) {
      passwordError = "Konfirmasi kata sandi baru tidak sama.";
      return;
    }
    passwordError = "";

    const result = await changePassword({
      password: $password,
      new_password: $newPassword,
      new_password_confirmation: $confirmation,
    });
    if (await report(result)) {
      resetPassword();
      resetNewPassword();
      resetConfirmation();
    }
  }
</script>

<div class="mx-auto max-w-2xl space-y-6">
  <h1 class="text-2xl font-extrabold text-slate-900">Profil</h1>

  <section class={cardClass}>
    <h2 class="mb-4 font-bold text-slate-900">Data Profil</h2>
    <form class="space-y-4" onsubmit={handleSaveProfile} novalidate>
      <div>
        <label class={labelClass} for="profile-name">Nama</label>
        <input id="profile-name" type="text" class={inputClass} bind:value={$name} />
      </div>
      <div>
        <label class={labelClass} for="profile-email">Email</label>
        <input id="profile-email" type="email" class={inputClass} bind:value={$email} />
      </div>
      {#if profileError}
        <p class="text-sm text-rose-600" role="alert">{profileError}</p>
      {/if}
      <button type="submit" class={primaryButton} disabled={$isUpdatingProfile}>
        {$isUpdatingProfile ? "Menyimpan..." : "Simpan Profil"}
      </button>
    </form>
  </section>

  <section class={cardClass}>
    <h2 class="mb-4 font-bold text-slate-900">Foto Profil</h2>
    <form class="space-y-4" onsubmit={handleUploadPhoto} novalidate>
      <img
        src={toAbsoluteUrl(($profile && $profile.photo) || DEFAULT_PHOTO_PATH)}
        alt="Foto profil saat ini"
        class="h-24 w-24 rounded-full object-cover" />
      <div>
        <label class={labelClass} for="profile-photo">Pilih foto baru</label>
        <input
          id="profile-photo"
          type="file"
          accept="image/*"
          class={inputClass}
          onchange={(event) => (photoFile = event.currentTarget.files[0])} />
      </div>
      {#if photoError}
        <p class="text-sm text-rose-600" role="alert">{photoError}</p>
      {/if}
      <button type="submit" class={primaryButton} disabled={$isUploadingPhoto}>
        {$isUploadingPhoto ? "Mengunggah..." : "Unggah Foto"}
      </button>
    </form>
  </section>

  <section class={cardClass}>
    <h2 class="mb-4 font-bold text-slate-900">Ubah Kata Sandi</h2>
    <form class="space-y-4" onsubmit={handleChangePassword} novalidate>
      <div>
        <label class={labelClass} for="current-password">Kata sandi saat ini</label>
        <input id="current-password" type="password" autocomplete="current-password" class={inputClass} bind:value={$password} />
      </div>
      <div>
        <label class={labelClass} for="new-password">Kata sandi baru</label>
        <input id="new-password" type="password" autocomplete="new-password" class={inputClass} bind:value={$newPassword} />
      </div>
      <div>
        <label class={labelClass} for="confirm-password">Konfirmasi kata sandi baru</label>
        <input id="confirm-password" type="password" autocomplete="new-password" class={inputClass} bind:value={$confirmation} />
      </div>
      {#if passwordError}
        <p class="text-sm text-rose-600" role="alert">{passwordError}</p>
      {/if}
      <button type="submit" class={primaryButton} disabled={$isChangingPassword}>
        {$isChangingPassword ? "Menyimpan..." : "Ubah Kata Sandi"}
      </button>
    </form>
  </section>
</div>
