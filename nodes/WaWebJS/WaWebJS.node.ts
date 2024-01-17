
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
                    // const responseData = await this.helpers.requestWithAuthentication.call(
                    //     this,
                    //     'waWebJSApi',
                    //     options,
                    // );
                    const responseData = {
                        "mimetype": "image/png",
                        "data": "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"
                    }
                    if (responseData.mimetype && responseData.data) {
                        let fileName = 'qrcode.png';
                        const mimeType = responseData.mimetype;
                        const binaryPropertyName = 'qrcode';
                        const data = responseData.data;
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