import { Log, UserManager } from 'oidc-client';
import { config } from "../Consts";

export class AuthService {
    constructor() {
        const settings = {
            authority: config.stsAuthority,
            client_id: config.clientId,
            redirect_uri: `${config.clientRoot}signing-callback.html`,
            silent_redirect_uri: `${config.clientRoot}silent-renew.html`,
            post_logout_redirect_uri: `${config.clientRoot}`,
            response_type: 'id_token token',
            scope: config.clientScope
        };
        this.userManager = new UserManager(settings)

        Log.logger = console;
        Log.level = Log.INFO;
    }

    getUser = () => {
        return this.userManager.getUser();
    }
}