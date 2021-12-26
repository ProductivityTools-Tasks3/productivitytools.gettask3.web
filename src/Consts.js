const dev={
    clientId:"devtasks3web",
    PATH_BASE :'https://localhost:8001/api/',
    stsAuthority : 'https://identityserver.productivitytools.tech:8010/',
    clientRoot : 'http://localhost:3000/',
}


const prod={
    clientId:"prodmeetingsweb",
    PATH_BASE :'https://meetings.productivitytools.tech:8020/api/',
    stsAuthority : 'https://identityserver.productivitytools.tech:8010/',
    clientRoot : 'https://meetingsweb.z13.web.core.windows.net/',
}

export const config = process.env.NODE_ENV === 'development' ? dev : prod;