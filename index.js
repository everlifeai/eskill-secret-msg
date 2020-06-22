'use strict'
const cote = require('cote')

/*      understand/
 * This is the main entry point where we start.
 *
 *      outcome/
 * Start our microservice.
 */
function main() {
    startMicroservice()
    registerWithCommMgr()
}

/* microservice key (identity of the microservice) */
let msKey = 'everlife-secret-msg'

const commMgrClient = new cote.Requester({
    name: 'Secret Message -> CommMgr',
    key: 'everlife-communication-svc',
})

function sendReply(msg, req) {
    req.type = 'reply'
    req.msg = String(msg)
    commMgrClient.send(req, (err) => {
        if(err) u.showErr(err)
    })
}
function startMicroservice() {

    /*      understand/
     * The microservice (partitioned by key to prevent
     * conflicting with other services).
     */
    const svc = new cote.Responder({
        name: 'Everlife Secret Message Skill',
        key: msKey,
    })

    /*      outcome/
     * Respond to user messages asking us to code/decode things
     */
    svc.on('msg', (req, cb) => {

        if(req.msg && req.msg.startsWith('/secret ')) {
            cb(null, true) /* Yes I am handling this message */
            sendReply('Your secret message is: ' + rot13(req.msg.substring('/secret '.length)), req)
        } else {
            cb() /* REMEMBER TO CALL THIS OTHERWISE THE AVATAR WILL WAIT FOR A RESPONSE FOREVER */
        }
    })
    function rot13(msg) {
        // http://stackoverflow.com/a/617685/987044
        return msg.replace(/[a-zA-Z]/g, function (c) {
            return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
        })
    }
}

function registerWithCommMgr() {
    commMgrClient.send({
        type: 'register-msg-handler',
        mskey: msKey,
        mstype: 'msg',
        mshelp: [ { cmd: '/secret', txt: 'encode/decode secret messages!' } ],
    }, (err) => {
        if(err) u.showErr(err)
    })
}
main()
