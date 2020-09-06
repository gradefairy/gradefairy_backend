const isLogin = (req, res) => {
    if(req.user) { // 로그인 되어있을때
        return req.user.id;
    } else return false; // 로그인 안되어있을때
}

module.exports = isLogin;