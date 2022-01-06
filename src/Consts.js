
const dev = {
    clientId: "devtasks3web",
    PATH_BASE: 'https://localhost:8001/api/',
    stsAuthority: 'https://identityserver.productivitytools.tech:8010/',
   // stsAuthority: 'https://localhost:5001/',
    clientRoot: 'http://localhost:3000/',
    clientScope : 'openid profile GetTask3.API'
}


const prod = {
    clientId: "devtasks3web",
    PATH_BASE: 'https://apigettask3.productivitytools.tech:8040/api/',
    stsAuthority: 'https://identityserver.productivitytools.tech:8010/',
    clientRoot: 'https://task3web.z13.web.core.windows.net/',
    clientScope : 'openid profile GetTask3.API'
}

export const config = process.env.NODE_ENV === 'development' ? dev : prod;