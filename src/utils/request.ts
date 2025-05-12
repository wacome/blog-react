import { toast } from 'react-hot-toast';

interface RequestOptions {
  url: string
  method?: string
  params?: Record<string, any>
  data?: any
  headers?: Record<string, string>
}

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export async function request<T = any>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', params, data, headers = {} } = options

  // 构建 URL
  let fullUrl = `/api${url}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      fullUrl += `?${queryString}`
    }
  }

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const responseData = await response.json()
    return responseData.data || responseData
  } catch (error) {
    console.error('Request failed:', error)
    throw error
  }
}

// 上传文件的请求函数
export async function uploadFile(
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<any> {
  const formData = new FormData()
  formData.append('file', file)

  const xhr = new XMLHttpRequest()
  xhr.open('POST', `/api${url}`)
  xhr.withCredentials = true

  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100
        onProgress(progress)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          if (response.code === 0) {
            resolve(response.data)
          } else {
            toast.error(response.message || '上传失败')
            reject(new Error(response.message || '上传失败'))
          }
        } catch (error) {
          toast.error('解析响应失败')
          reject(new Error('解析响应失败'))
        }
      } else {
        toast.error('上传失败')
        reject(new Error('上传失败'))
      }
    })

    xhr.addEventListener('error', () => {
      toast.error('网络错误')
      reject(new Error('网络错误'))
    })

    xhr.send(formData)
  })
} 