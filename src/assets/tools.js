export function cloneObj(o) {
    return JSON.parse(JSON.stringify(o));
}

export function httpReq(method, uri, query, form, body) {
    const options = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    };
    let url = import.meta.env.VITE_REQ_BACKEND_PREFIX + uri;//window.location.host
    if (query) {
        const searchParams = new URLSearchParams(query);
        url += '?' + searchParams.toString();
    }
    if (form) {
        var data = new FormData();
        for (let k of Objects.keys(form)) {
            data.append(k, form[k]);
        }
        options.body = data;
    }
    else if (body) {
        options.body = JSON.stringify(body);
        console.log(options.body);
    }
    return fetch(url, options).then(response => response.json()).catch(error => error);
}

export function genBranchesByNode(node) {
    if (!node || !node.ports || node.ports.length == 0)
        return [];
    const branches = [];
    node.ports.items.forEach(function (port, idx, array) {
        this.push({ branchName: port.attrs.text.text, id: port.id });
    }, branches);
    return branches;
}

export function copyProperties(src, target) {
    if (src == null || src == undefined)
        return;
    for (const [key, value] of Object.entries(src)) {
        if (value != null && value != undefined)
            target[key] = value;
    }
}

export function getDefaultBranch() {
    return {
        branchId: '',
        branchName: '',
        branchType: 'Condition',
        targetNodeId: '',
        conditionGroup: [
            [
                {
                    conditionType: 'UserInput',
                    refOptions: [],
                    refChoice: '',
                    compareOptions: [],
                    compareType: 'Eq',
                    targetOptions: [],
                    // targetChoice: '',
                    targetValueVariant: 'Const',
                    targetValue: '',
                    inputVariable: false,
                    caseSensitiveComparison: true,
                }
            ]
        ],
        editable: true,
    };
}

export function btoa(s) {
    return window.btoa(encodeURIComponent(s));
}

export function atob(s) {
    return decodeURIComponent(window.atob(s));
}

export function l(m) {
    if (!import.meta.env.PROD)
        console.log(m);
}

export function isOnGithub() {
    const u = window.location.href;
    return u.indexOf('dialogflowchatbot.github.io') > -1;
}
