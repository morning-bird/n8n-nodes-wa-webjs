import {
    IAuthenticateGeneric, ICredentialTestRequest,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class WaWebJSApi implements ICredentialType {
    name = 'waWebJSApi';
    displayName = 'WA WebJS API';
    properties: INodeProperties[] = [
        {
            displayName: 'Host URL',
            name: 'url',
            type: 'string',
            default: '',
        },
        {
            displayName: 'Session',
            name: 'session',
            type: 'string',
            typeOptions: { password: true },
            default: 'default',
        },
    ];

    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
        },
    };
    test: ICredentialTestRequest = {
        request: {
            baseURL: '={{$credentials.url}}',
            url: '/',
        },
    };

}