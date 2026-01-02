
const dev = {
    clientId: "devtasks3web",
    PATH_BASE: 'http://localhost:5513/api/',
    //PATH_BASE: 'https://apigettask3.productivitytools.tech:8040/api/',
    stsAuthority: 'https://identityserver.productivitytools.top:8010/',
    clientRoot: 'http://localhost:3000/',
    clientScope : 'openid profile GetTask3.API'
}


const prod = {
    clientId: "prodtasks3web",
    PATH_BASE: process.env.REACT_APP_PATH_BASE || 'https://tasks-api.productivitytools.top/api/',
    stsAuthority: process.env.REACT_APP_STS_AUTHORITY || 'https://identityserver.productivitytools.top:8010/',
    clientRoot: process.env.REACT_APP_CLIENT_ROOT || 'https://pt-tasks.web.app/',
    clientScope : 'openid profile GetTask3.API'
}

export const config = process.env.NODE_ENV === 'development' ? dev : prod;