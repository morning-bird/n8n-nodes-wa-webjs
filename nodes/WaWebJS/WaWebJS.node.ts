
import { IExecuteFunctions } from 'n8n-core';
import {
    IBinaryData,
    IBinaryKeyData,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { OptionsWithUri } from 'request';

export class WaWebJS implements INodeType {
    description: INodeTypeDescription = {
        // Basic node details will go here
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Chatting',
                        value: 'chatting',
                    },
                    {
                        name: 'Session',
                        value: 'session',
                    },
                    {
                        name: 'Auth',
                        value: 'auth',
                    },
                ],
                default: 'chatting',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['chatting'],
                    },
                },
                options: [
                    {
                        name: 'SendText',
                        value: 'sendText',
                        action: 'Send text',
                        description: 'Send Text Message',
                    },
                    {
                        name: 'SendPoll',
                        value: 'sendPoll',
                        action: 'Send poll',
                    },
                ],
                default: 'sendText',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['session'],
                    },
                },
                options: [
                    {
                        name: 'Me',
                        value: 'me',
                        action: 'Me',
                    },
                    {
                        name: 'Sessions',
                        value: 'sessions',
                        action: 'Sessions',
                    },
                    {
                        name: 'Start',
                        value: 'start',
                        action: 'Start',
                    },
                    {
                        name: 'Stop',
                        value: 'stop',
                        action: 'Stop',
                    },
                ],
                default: 'start',
            },
            {
                displayName: 'Chat ID',
                name: 'chatId',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['sendText', 'sendPoll'],
                        resource: ['chatting'],
                    },
                },
                default: '',
                placeholder: 'xxxxxxx@c.us',
            },
            {
                displayName: 'Text',
                name: 'text',
                type: 'string',
                required: true,
                typeOptions: {
                    rows: 4,
                },
                displayOptions: {
                    show: {
                        operation: ['sendText'],
                        resource: ['chatting'],
                    },
                },
                default: '',
                placeholder: '',
                description: 'Text to send',
            },
            {
                displayName: 'Title',
                name: 'title',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['sendPoll'],
                        resource: ['chatting'],
                    },
                },
                default: '',
                placeholder: '',
            },
            {
                displayName: 'Options',
                name: 'pollOptions',
                type: 'string',
                default: '',
                typeOptions: {
                    rows: 4,
                },
                displayOptions: {
                    show: {
                        operation: ['sendPoll'],
                        resource: ['chatting'],
                    },
                },
                placeholder: 'Semicolon separated option. Ex: option 1;option 2',
            },
            {
                displayName: 'Multiple Answers',
                name: 'multipleAnswers',
                type: 'boolean',
                displayOptions: {
                    show: {
                        operation: ['sendPoll'],
                        resource: ['chatting'],
                    },
                },
                default: false
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['auth'],
                    },
                },
                options: [
                    {
                        name: 'QR',
                        value: 'qr',
                        action: 'QR',
                    },
                ],
                default: 'qr',
            },
            {
                displayName: 'Webhook URL',
                name: 'webhookUrl',
                type: 'string',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['start'],
                        resource: ['session'],
                    },
                },
                default: '',
                placeholder: 'https://n8n.gms.church/xxxxxxxxx',
            },
        ],
        version: 1,
        defaults: {
            name: 'WaWebJS',
        },
        inputs: ['main'],
        outputs: ['main'],
        displayName: 'Whatsapp WebJS',
        name: 'WaWebJS',
        icon: 'file:wa.svg',
        group: ['whatsapp'],
        description: 'Connect with Whatsapp WebJS API',
        credentials: [
            {
                name: 'waWebJSApi',
                required: true,
            },
        ],
        requestDefaults: {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            baseURL: '={{$credentials.url}}',
        },
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const cred = await this.getCredentials('waWebJSApi');
        const session = cred.session;
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0) as string;
        var options: OptionsWithUri = {
            uri: `${cred.url}`,
            json: true,
        };
        for (let i = 0; i < items.length; i++) {
            if (resource === 'chatting') {
                if (operation === 'sendText') {
                    const chatId = this.getNodeParameter('chatId', i) as string;
                    const text = this.getNodeParameter('text', i) as string;
                    options.method = 'POST';
                    options.uri += `/${session}/messages/send-text`;
                    options.body = {
                        chatId: chatId,
                        text: text
                    };
                    const responseData = await this.helpers.requestWithAuthentication.call(
                        this,
                        'waWebJSApi',
                        options,
                    );
                    returnData.push({
                        json: responseData,
                    });
                } else if (operation === 'sendPoll') {
                    const chatId = this.getNodeParameter('chatId', i);
                    const title = this.getNodeParameter('title', i);
                    const nodeOptionsParam = this.getNodeParameter('pollOptions', i) as string;
                    let pollOptions: string[] = [];
                    if (nodeOptionsParam) {
                        nodeOptionsParam.split(';').map((option) => option.trim())
                    }
                    const multipleAnswers = this.getNodeParameter('multipleAnswers', i);
                    options.method = 'POST';
                    options.uri += `/${session}/messages/send-text`;
                    options.body = {
                        chatId: chatId,
                        poll: {
                            name: title,
                            options: pollOptions,
                            multipleAnswers: multipleAnswers,
                        },
                    };
                    const responseData = await this.helpers.requestWithAuthentication.call(
                        this,
                        'waWebJSApi',
                        options,
                    );
                    returnData.push({
                        json: responseData,
                    });
                }
            } else if (resource === 'session') {
                if (operation === 'start') {
                    const url = this.getNodeParameter('webhookUrl', i) as string;
                    options.method = 'POST';
                    options.uri += `/sessions/${session}/start`;
                    options.body = {
                        webhookUrl: url
                    };
                    const responseData = await this.helpers.requestWithAuthentication.call(
                        this,
                        'waWebJSApi',
                        options,
                    );
                    returnData.push({
                        json: responseData,
                    });
                } else if (operation === 'stop') {
                    options.method = 'POST';
                    options.uri += `/sessions/${session}/stop`;
                    const responseData = await this.helpers.requestWithAuthentication.call(
                        this,
                        'waWebJSApi',
                        options,
                    );
                    returnData.push({
                        json: responseData,
                    });
                } else if (operation === 'me') {
                    options.method = 'GET';
                    options.uri += `/sessions/${session}/me`;
                    const responseData = await this.helpers.requestWithAuthentication.call(
                        this,
                        'waWebJSApi',
                        options,
                    );
                    returnData.push({
                        json: responseData,
                    });
                }
            } else if (resource === 'auth') {
                if (operation === 'qr') {
                    options.method = 'GET';
                    options.uri += `/sessions/${cred.session}/auth/qr`;
                    const responseData = await this.helpers.requestWithAuthentication.call(
                        this,
                        'waWebJSApi',
                        options,
                    );
                    if (responseData.mimetype && responseData.data) {
                        let fileName = 'qrcode.png';
                        const mimeType = responseData.mimetype;
                        const binaryPropertyName = 'qrcode';
                        // hapus string yang tidak perlu
                        const data = responseData.data.startsWith("data:image/png;base64,") ?
                            responseData.replace("data:image/png;base64,", "")
                            : responseData.data;
                        const binary = {
                            [binaryPropertyName]: { data, fileName, mimeType } as IBinaryData,
                        } as IBinaryKeyData;
                        returnData.push({
                            json: responseData,
                            binary,
                        });
                    } else {
                        returnData.push({
                            json: responseData
                        })
                    }
                }
            }
        }
        return this.prepareOutputData(returnData);
    }
}