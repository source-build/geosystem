/** 成功响应，后端统一格式，对应http状态码200 */
export class ResponseOK {
  code: number; //业务码
  msg: string; //成功描述
  result: any;//响应数据(JSON格式)

  constructor(code: number, msg: string, result?: any) {
    this.code = code;
    this.msg = msg;
    this.result = result;
  }
}

/** 错误响应，后端统一格式，对应http状态码 400 OR 500 */
export class ResponseErr {
  code: number; // 业务码
  err_msg: string; //错误描述
  result: any; //响应数据(JSON格式)

  constructor(code: number, err_msg: string, result?: any) {
    this.code = code;
    this.err_msg = err_msg;
    this.result = result;
  }
}
