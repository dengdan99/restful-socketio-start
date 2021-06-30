// 截取字符串，多余的部分用...代替
export const setString = (str: string, len: number): string => {
let StrLen = 0
let s = ''
for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 128) {
    StrLen += 2
    } else {
    StrLen++
    }
    s += str.charAt(i)
    if (StrLen >= len) {
    return s + '...'
    }
}
return s
}

// 数组去重
export const HovercUnique = (arr: Array<any>): Array<any> => {
    const n = {}
    const r = []
    for (var i = 0; i < arr.length; i++) {
        if (!n[arr[i]]) {
            n[arr[i]] = true
            r.push(arr[i])
        }
    }
    return r
}

// 获取json长度
export const getJsonLength = (jsonData: object): number => {
    var arr = []
    for (var item in jsonData) {
        arr.push(jsonData[item])
    }
    return arr.length
}
