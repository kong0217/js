const signHeaderKey = 'lkWeiboSTSignHeaderKey';
const lk = new ToolKit('微博超话签到', 'WeiboSTSign');
const isEnableLog = JSON.parse(lk.getVal('lkIsEnableLogWeiboST', true));
const isClearCookie = JSON.parse(lk.getVal('lkIsClearCookie', false));
const userFollowSTKey = 'lkUserFollowSTKey';
var accounts = JSON.parse(lk.getVal(userFollowSTKey, false));

if (!lk.isExecComm) {
    !(async () => {
        lk.boxJsJsonBuilder();
        let cookie = lk.getVal(signHeaderKey);
        //校验cookie
        lk.log(lk.getVal(userFollowSTKey));
        if (!cookie || isClearCookie || !accounts) {
            lk.execFail();
            lk.setVal(signHeaderKey, '');
            lk.appendNotifyInfo(isClearCookie ? '手动清除cookie' : '未获取到cookie或关注列表，请重新获取❌');
        } else {
            await signIn(); //签到
        }
        lk.msg('');
        lk.done();
    })();
}

function signIn() {
    return new Promise(async (resolve, reject) => {
        for (let i in accounts) {
            let name = accounts[i][0];
            let super_id = accounts[i][1];
            await superTalkSignIn(i, name, super_id);
        }
        resolve();
    });
}

function superTalkSignIn(index, name, super_id) {
    return new Promise((resolve, reject) => {
        let super_url = {
            url: 'https://weibo.com/p/aj/general/button?ajwvr=6&api=http://i.huati.weibo.com/aj/super/checkin&texta=%E7%AD%BE%E5%88%B0&textb=%E5%B7%B2%E7%AD%BE%E5%88%B0&status=0&id=' + super_id + '&location=page_100808_super_index&timezone=GMT+0800&lang=zh-cn&plat=MacIntel&ua=Mozilla/5.0%20(Macintosh;%20Intel%20Mac%20OS%20X%2010_15)%20AppleWebKit/605.1.15%20(KHTML,%20like%20Gecko)%20Version/13.0.4%20Safari/605.1.15&screen=375*812&__rnd=1576850070506',
            headers: {
                Cookie: lk.getVal(signHeaderKey),
                'User-Agent': lk.userAgent
            }
        };
        lk.get(super_url, (error, response, data) => {
            lk.log('\n' + JSON.stringify(data));
            try {
                if (error) {
                    lk.execFail();
                    lk.appendNotifyInfo(`【${name}】超话签到错误！-${error}`);
                } else {
                    var obj = JSON.parse(data);
                    var code = obj.code;
                    var msg = obj.msg;
                    if (code == 100003) { // 行为异常，需要重新验证
                        lk.execFail();
                        lk.appendNotifyInfo(`【${name}】超话签到❕${msg}${obj.data.location}`);
                    } else if (code == 100000) {
                        let tipMessage = obj.data.tipMessage;
                        let alert_title = obj.data.alert_title;
                        let alert_subtitle = obj.data.alert_subtitle;
                        lk.appendNotifyInfo(`【${name}】超话签到成功🎉\n${alert_title}:${alert_subtitle}`);
                    } else if (code == 382004) {
                        msg = msg.replace('(382004)', '');
                        lk.appendNotifyInfo(`【${name}】超话${msg} 🎉`);
                    } else {
                        lk.execFail();
                        lk.appendNotifyInfo(`【${name}】超话签到${msg}`);
                    }
                }
            } catch (e) {
                lk.logErr(e);
                lk.execFail();
                lk.appendNotifyInfo('签到失败❌，请重新获取cookie！');
            } finally {
                resolve();
            }
        });
    });
}
