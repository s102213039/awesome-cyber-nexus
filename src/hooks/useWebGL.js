import { useContext } from 'react';
import { WebGLContext } from '../context/WebGLContextCore';

export default function useWebGL() {
  const context = useContext(WebGLContext);
  if (!context) {
    throw new Error('useWebGL must be used within a WebGLProvider');
  }
  return context;
}
