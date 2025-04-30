/* 错误状态码
*
* 1 -
* 2 -
* */

export enum msgCode {
    SUCCESSFUL = 0, // 请求操作成功
    ERR_METHOD = 1, // 请求方式错误
    ERR_LOGOUT = 2, // 用户尚未登录
    ERR_SUBMIT = 3, // 提交内容错误
    ERR_SERVER = 4, // 服务处理错误
    ERR_ACTION = 5, // 上传内容错误
    ERR_DB_ERR = 6, // 数据处理错误
    ERR_CA_ERR = 7,
    ERR_NS_ERR = 8,
    ERR_OTHERS = 9, // 其他未知错误
}