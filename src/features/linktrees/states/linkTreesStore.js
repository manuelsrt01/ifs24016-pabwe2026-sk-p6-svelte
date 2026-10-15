import { writable } from "svelte/store";
import { linkTreeApi } from "../api/linkTreeApi.js";
import { runAction } from "../../../helpers/storeHelper.js";

export const linkTrees = writable([]);
export const linkTree = writable(null);
export const linkTreesLoading = writable(false);
export const linkTreesError = writable(null);
export const linkTreeError = writable(null);

export const isAdding = writable(false);
export const isChanging = writable(false);
export const isChangingCover = writable(false);
export const isDeleting = writable(false);
export const isDeletingAll = writable(false);
export const isMutatingItem = writable(false);

let lastIsMe = false;

export function resetLinkTreesState() {
  lastIsMe = false;
  linkTrees.set([]);
  linkTree.set(null);
  linkTreesLoading.set(false);
  linkTreesError.set(null);
  linkTreeError.set(null);
}

export async function fetchLinkTrees(isMe = false) {
  lastIsMe = isMe;
  linkTreesLoading.set(true);
  linkTreesError.set(null);
  try {
    const response = await linkTreeApi.getAll(isMe);
    linkTrees.set(response.data?.link_trees ?? []);
  } catch (error) {
    linkTrees.set([]);
    linkTreesError.set(error.message);
  } finally {
    linkTreesLoading.set(false);
  }
}

export async function fetchLinkTree(id) {
  linkTreeError.set(null);
  try {
    const response = await linkTreeApi.getById(id);
    const detail = response.data?.link_tree;
    if (!detail) {
      throw new Error("Data link tree tidak ditemukan.");
    }
    linkTree.set(detail);
  } catch (error) {
    linkTree.set(null);
    linkTreeError.set(error.message);
  }
}

export function clearLinkTree() {
  linkTree.set(null);
  linkTreeError.set(null);
}

async function refreshList(result) {
  if (result.ok) await fetchLinkTrees(lastIsMe);
  return result;
}

async function refreshDetail(result, id) {
  if (result.ok) await fetchLinkTree(id);
  return result;
}

export async function addLinkTree(payload) {
  return refreshList(await runAction(isAdding, () => linkTreeApi.create(payload)));
}

export async function removeLinkTree(id) {
  return refreshList(await runAction(isDeleting, () => linkTreeApi.remove(id)));
}

export async function removeAllLinkTrees() {
  return refreshList(await runAction(isDeletingAll, () => linkTreeApi.removeAll()));
}

export async function changeLinkTree(id, payload) {
  return refreshDetail(await runAction(isChanging, () => linkTreeApi.update(id, payload)), id);
}

export async function changeCover(id, file) {
  return refreshDetail(await runAction(isChangingCover, () => linkTreeApi.uploadCover(id, file)), id);
}

export async function addItem(id, payload) {
  return refreshDetail(await runAction(isMutatingItem, () => linkTreeApi.addItem(id, payload)), id);
}

export async function changeItem(id, itemId, payload) {
  return refreshDetail(
    await runAction(isMutatingItem, () => linkTreeApi.updateItem(id, itemId, payload)),
    id
  );
}

export async function removeItem(id, itemId) {
  return refreshDetail(await runAction(isMutatingItem, () => linkTreeApi.removeItem(id, itemId)), id);
}
