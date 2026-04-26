import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ProfilePostComment {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface ProfilePost {
  id: number;
  content: string;
  createdAt: string;
  likeCount: number;
  likedByMe: boolean;
  comments: ProfilePostComment[];
}

const STORAGE_KEY = "profile_posts_v1";

export async function getProfilePosts(): Promise<ProfilePost[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ProfilePost[];
    return parsed.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  } catch {
    return [];
  }
}

async function saveProfilePosts(posts: ProfilePost[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export async function createProfilePost(content: string): Promise<ProfilePost> {
  const posts = await getProfilePosts();

  const newPost: ProfilePost = {
    id: Date.now(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
    likeCount: 0,
    likedByMe: false,
    comments: [],
  };

  const nextPosts = [newPost, ...posts];
  await saveProfilePosts(nextPosts);
  return newPost;
}

export async function updateProfilePost(postId: number, content: string): Promise<ProfilePost | null> {
  const posts = await getProfilePosts();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx < 0) return null;

  const updated: ProfilePost = { ...posts[idx], content: content.trim() };
  const next = [...posts];
  next[idx] = updated;
  await saveProfilePosts(next);
  return updated;
}

export async function getProfilePostById(postId: number): Promise<ProfilePost | null> {
  const posts = await getProfilePosts();
  return posts.find((p) => p.id === postId) ?? null;
}

export async function toggleLikeProfilePost(postId: number): Promise<ProfilePost | null> {
  const posts = await getProfilePosts();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx < 0) return null;

  const prev = posts[idx];
  const likedByMe = !prev.likedByMe;
  const likeCount = Math.max(0, prev.likeCount + (likedByMe ? 1 : -1));
  const updated = { ...prev, likedByMe, likeCount };

  const next = [...posts];
  next[idx] = updated;
  await saveProfilePosts(next);
  return updated;
}

export async function addCommentToProfilePost(postId: number, content: string, authorName: string): Promise<ProfilePost | null> {
  const posts = await getProfilePosts();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx < 0) return null;

  const prev = posts[idx];
  const comment: ProfilePostComment = {
    id: Date.now(),
    authorName,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  const updated: ProfilePost = {
    ...prev,
    comments: [...prev.comments, comment],
  };

  const next = [...posts];
  next[idx] = updated;
  await saveProfilePosts(next);
  return updated;
}
