import { auth, storage } from '@/core/firebase'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

const safeFileName = (name: string) => name
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9._-]/g, '-')
  .replace(/-+/g, '-')
  .slice(-90)

export const questionImageService = {
  validate(file: File): void {
    if (!file.type.startsWith('image/')) throw new Error('Selecciona un archivo de imagen.')
    if (file.size > MAX_IMAGE_BYTES) throw new Error('La imagen debe pesar menos de 8 MB.')
  },

  async upload(file: File): Promise<{ url: string; storagePath: string }> {
    this.validate(file)
    const user = auth.currentUser
    if (!user) throw new Error('Debes iniciar sesión para subir una imagen.')
    const storagePath = `question-images/${user.uid}/${Date.now()}-${safeFileName(file.name || 'imagen')}`
    const objectRef = ref(storage, storagePath)
    await uploadBytes(objectRef, file, {
      contentType: file.type,
      customMetadata: { uploadedBy: user.uid, purpose: 'game-question' },
    })
    return { url: await getDownloadURL(objectRef), storagePath }
  },

  async remove(storagePath?: string): Promise<void> {
    if (!storagePath) return
    try { await deleteObject(ref(storage, storagePath)) } catch (error) { console.warn('No se pudo eliminar la imagen anterior.', error) }
  },
}
