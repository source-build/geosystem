import axios, {
  AxiosError,
  AxiosRequestConfig,
  GenericAbortSignal,
} from "axios";
import { getLocalStoreToken, setTokenToLocalStore } from "./auth";
import router from "@/router";
import { dayjs, ElMessageBox } from "element-plus";
import { ResponseErr } from "@/types/response";
import { DEMO_MODE, resolveMock } from "@/mock";
// @ts-ignore
import jsonBig from "json-bigint";

const jsonBigString = new jsonBig({ storeAsString: true });

// create new instance
const instance = axios.create({
  transformResponse: [
    function (data) {
      // 高精度数字处理
      if (typeof data === "string") {
        try {
          return jsonBigString.parse(data);
        } catch (error) {
          // JSON 解析失败时，返回原始字符串数据
          // 这样可以确保错误响应中的 HTTP 状态码等信息能够正确传递到错误拦截器
          return data;
        }
      } else {
        return data;
      }
    },
  ],
});
const baseURL = import.meta.env.VITE_APP_API_GATEWAY;
instance.defaults.headers.post["Content-Type"] =
  import.meta.env.VITE_APP_HTTP_CONTENT_TYPE;
instance.defaults.timeout = 1000 * 30;

instance.interceptors.request.use(useRequest, useRequestError);
instance.interceptors.response.use(useResponse, useResponseError);

/**
 * Request 请求库
 * 取消请求示例:
    //配置
    const controller = new AbortController();
    controller.abort() //取消请求
    //请求
    Request.DELETE("/system/permission/supreme/menu",{},controller.signal);
 */

// request use;
function useRequest(config: any) {
  config.headers.Authorization = `Bearer ${getLocalStoreToken()}`;
  return config;
}

// request failed use;
function useRequestError(error: any) {
  // TODO: request failed;
  return Promise.reject(error);
}

// response use; 2xx
function useResponse(response: any) {
  //update localStore login token
  if (response.headers.renewal || response.headers.Renewal) {
    setTokenToLocalStore(response.headers.renewal || response.headers.Renewal);
  }

  if (response.status === 200) {
    return Promise.resolve(response);
  }

  /* TODO: handle business code */

  /* TODO: handle http error */
  // ...
  return Promise.reject(response);
}

// response failed use; >2xx
function useResponseError(error: AxiosError) {
  const { response, code } = error;
  if (!response) {
    //cancel
    if (code == AxiosError.ERR_CANCELED) {
      return Promise.reject(new ResponseErr(10700, "请求取消"));
    }

    return Promise.reject(new ResponseErr(10400, "网络连接失败"));
  }

  //update localStore login token
  const renewal = response.headers.renewal || response.headers.Renewal;
  if (renewal) {
    setTokenToLocalStore(renewal);
  }

  const { status, data }: any = response;
  // no body
  if (!data) {
    return Promise.reject(new ResponseErr(10400, "请求失败"));
  }
  // 系统不可用
  if (status === 403) {
    // ip 被限制访问
    if (data.code == 40333) {
      return Promise.reject({ code: -1, err_msg: data.msg });
    }

    // 当前处于演示环境，部分接口已被保护，无法修改数据
    return Promise.reject({ code: -1, err_msg: data.msg });
  }
  // 资源不存在
  if (status === 404) {
    return Promise.reject({ code: -1, err_msg: "访问的资源不存在" });
  }
  /* handle client business error */
  if (status === 400) {
    return handleClientBusinessError(data);
  }
  /* handle server business error */
  if (status === 500) {
    if(data.err_msg&&response.headers['x-trace-id']){
      data.err_msg += `，Request ID：${response.headers['x-trace-id']}`
    }
    return handleServerBusinessError(data);
  }

  // ...TODO: Other error
  return Promise.reject(data);
}

// 客户端错误
function handleClientBusinessError(data: any) {
  switch (data.code) {
    /* 无效的token，token验证失败 */
    case 10440:
      data.err_msg = "登录过期";
      ElMessageBox.confirm(data.err_msg, "警告", {
        confirmButtonText: "重新登录",
        type: "warning",
        showCancelButton: false,
        closeOnClickModal: false,
        closeOnPressEscape: false,
      }).then(() => {
        router.push({ path: "/login", replace: true });
      });
      break;
    /* 账号临时封号 */
    case 10600:
      let text = `你的账号已被临时封号！`
      if(data.result){
        text = `你的账号已被临时封号，解封时间：${data.result.release_time?dayjs(data.result.release_time).format('YYYY-MM-DD HH:mm:ss'):'无'}，封号原因：${data.result.describe||'无'}！`
      }
      ElMessageBox.confirm(text, "临时封号提醒", {
        confirmButtonText: "我知道了",
        type: "warning",
        showCancelButton: false,
        closeOnClickModal: false,
        closeOnPressEscape: false,
      }).then(() => {
        router.push({ path: "/login", replace: true });
      });
      break;
    /* 账号永久封号 */
    case 10402:
      ElMessageBox.confirm('你的账号已被永久封号，无法登录!', "永久封号提醒", {
        confirmButtonText: "我知道了",
        type: "warning",
        showCancelButton: false,
        closeOnClickModal: false,
        closeOnPressEscape: false,
      }).then(() => {
        router.push({ path: "/login", replace: true });
      });
      break;
    /* 用户IP发生变化 */
    case 10415:
      ElMessageBox.confirm(
        "检测到你的IP发生了改变，为了数据安全，请重新登录!",
        "IP发生变化",
        {
          confirmButtonText: "退出系统",
          type: "warning",
          showCancelButton: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
        }
      ).then(() => {
        router.push({ path: "/login", replace: true });
      });
      break;
    /* 账号过期 */
    case 10442:
      ElMessageBox.confirm(
        "你的账号已过期，请重新登录！",
        "账号过期",
        {
          confirmButtonText: "我知道了",
          type: "warning",
          showCancelButton: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
        }
      )
      router.push({ path: "/login", replace: true });
      break;
    /* same as failed */
    case 10406:
      if (data.err_msg == "此操作需要更高的权限") {
        ElMessageBox.confirm(
          "此操作需要更高的权限，你没有该权限！",
          "权限不足",
          {
            confirmButtonText: "我知道了",
            type: "warning",
            showCancelButton: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
          }
        )
        return Promise.reject(data);
      }
      router.push({ path: "/login", replace: true });
      break;
    /* 登录失效 */
    case 10407:
      console.log("登录失效");
      // delTokenUser();
      router.push({ path: "/login" });
      break;
    /* 找不到token */
    case 10408:
      router.push({ path: "/login", replace: true });
      break;
    /* 账号在别处登录 */
    case 10409:
      let device_type = "";
      switch (data.result.device_type) {
        case "MOBILE":
          device_type = "手机";
          break;
        case "WEB":
          device_type = "电脑端";
          break;
        case "H5":
          device_type = "手机浏览器";
          break;
        case "WECHAT_WEB":
          device_type = "微信公众号";
          break;
      }

      console.log("账号在别处登录");
      // delTokenUser();
      ElMessageBox.confirm(
        `账号于${data.result.login_time}在${data.result.place}地区使用${
          device_type || "未知设备"
        }异地登录，登录IP：${data.result.ip}，登录设备：${
          data.result.device_name
        }。`,
        "账号在别处登录",
        {
          confirmButtonText: "退出系统",
          type: "warning",
          showCancelButton: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
        }
      ).then(() => {
        router.push({ path: "/login", replace: true });
      });
      break;
  }

  return Promise.reject(data);
}

// 服务端错误
function handleServerBusinessError(data: any) {
  return Promise.reject(data);
}

export default class Request {
  static GET(
    url: string,
    params = {},
    signal?: GenericAbortSignal,
    headers = {}
  ) {
    return this.request({
      url,
      method: "GET",
      params,
      signal,
      headers,
    });
  }

  static POST(
    url: string,
    params = {},
    signal?: GenericAbortSignal,
    headers = {}
  ) {
    return this.request({ url, method: "POST", params, signal, headers });
  }

  static DELETE(
    url: string,
    params = {},
    signal?: GenericAbortSignal,
    headers = {}
  ) {
    return this.request({ url, method: "DELETE", params, signal, headers });
  }

  static PUT(
    url: string,
    params = {},
    signal?: GenericAbortSignal,
    headers = {}
  ) {
    return this.request({ url, method: "PUT", params, signal, headers });
  }

  static PATCH(
    url: string,
    params = {},
    signal?: GenericAbortSignal,
    headers = {}
  ) {
    return this.request({ url, method: "PATCH", params, signal, headers });
  }

  static request(config: any) {
    let { url, method, params, headers, signal } = config;

    // 演示模式：返回本地接口快照，不发起网络请求
    if (DEMO_MODE) {
      const body = resolveMock(String(method), String(url));
      if (body !== undefined) {
        return Promise.resolve({ data: body, status: 200, headers: {} });
      }
    }

    url = baseURL + url;
    const m = method.toUpperCase();
    let conf: AxiosRequestConfig = {
      url: url,
      method: m,
      signal: signal,
      headers: headers,
    };
    if (m == "GET") {
      conf.params = params;
    } else {
      conf.data = params;
    }
    return instance(conf);
  }

  static axios(config: any) {
    if (config.isBaseURL) {
      config.url = baseURL + config.url;
    }
    return axios(config);
  }

  /**
   * 下载文件
   * @param config 配置对象
   * @param config.url 请求地址
   * @param config.params 请求参数
   * @param config.fileName 下载的文件名（可选，如果不传则从响应头获取）
   * @param config.headers 请求头（可选，会覆盖默认headers）
   * @param config.withToken 是否携带token（默认true）
   * @param config.signal 取消请求信号
   */
  static async download(config: {
    url: string;
    params?: any;
    fileName?: string;
    headers?: Record<string, string>;
    withToken?: boolean;
    signal?: GenericAbortSignal;
  }) {
    const { url, params = {}, fileName, headers = {}, withToken = true, signal } = config;
    const fullUrl = baseURL + url;
    
    const requestHeaders: Record<string, string> = { ...headers };
    
    // 如果需要携带token，添加Authorization头
    if (withToken) {
      const token = getLocalStoreToken();
      requestHeaders.Authorization = `Bearer ${token}`;
    }
    
    const axiosConfig: AxiosRequestConfig = {
      url: fullUrl,
      method: "GET",
      params,
      signal,
      responseType: "blob",
      headers: requestHeaders,
    };
    
    const response = await axios(axiosConfig);
    // 从响应头获取文件名
    let downloadFileName = fileName;
    if (!downloadFileName) {
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          downloadFileName = decodeURIComponent(matches[1].replace(/['"]/g, ""));
        }
      }
    }
    // 如果还没有文件名，使用默认名称
    if (!downloadFileName) {
      downloadFileName = "download";
    }
    // 创建下载链接
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    return response;
  }
}
