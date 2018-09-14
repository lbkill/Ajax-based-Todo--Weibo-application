
var apiWeiboAll = function(callback) {
    var path = '/api/weibo/all';
    ajax('GET', path, '', callback)
};

var apiWeiboAdd = function(form, callback) {
    var path = '/api/weibo/add';
    log('apiWeiboAdd',form);
    ajax('POST', path, form, callback)
};

var apiWeiboDelete = function(weibo_id, callback) {
    var path = `/api/weibo/delete?id=${weibo_id}`;
    ajax('GET', path, '', callback)
};

var apiWeiboUpdate = function(form, callback) {
    var path = '/api/weibo/update';
    ajax('POST', path, form, callback)
};

var apiCommentAdd = function(form, callback) {
    var path = '/api/comment/add';
    ajax('POST', path, form, callback)
};

var apiCommentDelete = function(com_id, callback) {
    var path = `/api/comment/delete?id=${com_id}`;
    ajax('GET', path, '', callback)
};

var apiCommentUpdate = function(form, callback) {
    var path = '/api/comment/update';
    ajax('POST', path, form, callback)
};

var weiboTemplate = function(weibo, username, comment) {
    var t = `
        <div class="weibo-cell" data-id="${weibo.id}">
            <span class="weibo-content">${weibo.content}</span>
            <span>from：${username}</span>
            <button class="weibo-delete">删除</button>
            <button class="weibo-edit">编辑</button>
            <br>
            <input class="comment-add-input" >
            <button class="comment-add">添加评论</button>
            ${comment}
        </div>
    `;
    return t
};

var commentTemplate = function(comment) {
    var t = `
        <div class="comment-cell" data-id="${comment.id}">
            <span class="comment-content">${comment.content}</span>
            <button class="comment-delete" >删除</button>
            <button class="comment-edit" >编辑</button>
        </div>
    `;
    return t
};

var weiboUpdateTemplate = function(content) {
    var t = `
        <div class="weibo-update-form">
            <input class="weibo-update-input" value="${content}">
            <button class="weibo-update">更新</button>
        </div>
    `;
    return t
};

var commentUpdateTemplate = function(content) {
    var t = `
        <div class="comment-update-form">
            <input class="comment-update-input" value="${content}">
            <button class="comment-update">更新</button>
        </div>
    `;
    return t
};

var insertWeibo = function(weibo) {
    // var weiboCell = weiboTemplate(weibo)
    // 插入 weibo-list
    var weiboList = e('#id-weibo-list');
    weiboList.insertAdjacentHTML('beforeend', weibo)
};

var insertUpdateForm = function(content, weiboCell) {
    var updateForm = weiboUpdateTemplate(content);
    weiboCell.insertAdjacentHTML('beforeend', updateForm)
};

var insertCommentUpdateForm = function(content, commentCell) {
    var updateForm = commentUpdateTemplate(content);
    commentCell.insertAdjacentHTML('beforeend', updateForm)
};

var loadWeibos = function() {
    apiWeiboAll(function(form) {
        log('load all weibos&comments', form);
        if (form.message == '权限不足，请登录后访问weibo'){
            alert(form.message)
        } else {
            // 循环添加到页面中
            for(var i = 0; i < form.weibo_comment.length; i++) {
                var weibo = form.weibo_comment[i];
                var comments = weibo.comment;
                var username = weibo.username;
                var comTm = [];
                if (comments.length != 0) {
                    for (var j = 0; j < comments.length; j++) {
                        com = comments[j];
                        // 每条下面的微博评论
                        comTm.push(commentTemplate(com))
                    }
                }
                com = comTm.join('');
                insertWeibo(weiboTemplate(weibo.weibo, username,com))
            }
        }

    })
    // second call
};

var bindEventCommentAdd = function() {
    var weiboList = e('#id-weibo-list');
    // 事件响应函数会传入一个参数 就是事件本身
    weiboList.addEventListener('click', function(event) {
    log(event);
    // 我们可以通过 event.target 来得到被点击的对象
    var self = event.target;
    log('被点击的元素', self);
    log(self.classList);
    if (self.classList.contains('comment-add')) {
        log('点到了添加评论按钮');

        weiboCell = self.closest('.weibo-cell');
        log('看看这是啥',weiboCell);
        weiboId = weiboCell.dataset['id'];
        log('comment add weibo id', weiboId);
        input = e('.comment-add-input', weiboCell);
        content = input.value;
        var form = {
            weibo_id: weiboId,
            content: content,
        };

        apiCommentAdd(form, function(comment) {
            // 收到返回的数据, 插入到页面中
            log('apiweiboUpdate', comment);
            var c = commentTemplate(comment);
            weiboCell.insertAdjacentHTML('beforeend', c);
            input.value = ''

        })
    } else {
        log('点到了 weibo cell')
    }
})};

var bindEventCommentDelete = function() {
    var weiboList = e('#id-weibo-list');
    // 事件响应函数会传入一个参数 就是事件本身
    weiboList.addEventListener('click', function(event) {
    log(event);
    // 我们可以通过 event.target 来得到被点击的对象
    var self = event.target;
    log('被点击的元素', self);
    log(self.classList);
    if (self.classList.contains('comment-delete')) {
        log('点到了评论删除按钮');
        commentId = self.parentElement.dataset['id'];
        apiCommentDelete(commentId, function(d) {
            log('apiCommentDelete', d.message);
            // 删除 self 的父节点
            self.parentElement.remove();
            alert(d.message)
        })
    } else {
        log('点到了 weibo cell')
    }
})};

var bindEventCommentEdit = function() {
    var weiboList = e('#id-weibo-list');
    // 事件响应函数会传入一个参数 就是事件本身
    weiboList.addEventListener('click', function(event) {
        log(event);
        // 我们可以通过 event.target 来得到被点击的对象
        var self = event.target;
        log('被点击的元素', self);
        log(self.classList);
        if (self.classList.contains('comment-edit')) {
            log('点到了评论编辑按钮');
            commentCell = self.closest('.comment-cell');
            commentId = commentCell.dataset['id'];
            var commentSpan = e('.comment-content', commentCell);
            var content = commentSpan.innerText;
            // 插入编辑输入框
            insertCommentUpdateForm(content, commentCell)
        } else {
            log('点到了 comment cell')
        }
    })};

var bindEventCommentUpdate = function() {
    var weiboList = e('#id-weibo-list');
    // 事件响应函数会传入一个参数 就是事件本身
    weiboList.addEventListener('click', function(event) {
        log(event);
        // 我们可以通过 event.target 来得到被点击的对象
        var self = event.target;
        log('被点击的元素', self);
        log(self.classList);
        if (self.classList.contains('comment-update')) {
            log('点到了评论更新按钮');
            commentCell = self.closest('.comment-cell');
            commentId = commentCell.dataset['id'];
            weiboCell = self.closest('.weibo-cell');
            weiboId = weiboCell.dataset['id'];
            log('update comment id', commentCell);
            input = e('.comment-update-input', commentCell);
            content = input.value;
            var form = {
                id: commentId,
                weibo_id: weiboId,
                content: content,
            };

            apiCommentUpdate(form, function(comment) {
                // 收到返回的数据, 插入到页面中
                log('apiweiboUpdate', comment);
                if (comment.message == '无权操作'){
                    alert(comment.message)
                } else {
                    var commentSpan = e('.comment-content', commentCell);
                    commentSpan.innerText = comment.content;

                    var updateForm = e('.comment-update-form', commentCell);
                    updateForm.remove()
                }

            })
        } else {
            log('点到了 comment cell')
        }
    })};

var bindEventWeiboAdd = function() {
    var b = e('#id-button-add');
    // 注意, 第二个参数可以直接给出定义函数
    b.addEventListener('click', function(){
        var input = e('#id-input-weibo');
        var content = input.value;
        log('click add', content);
        var form = {
            content: content,
        };
        apiWeiboAdd(form, function(form) {
            // 收到返回的数据, 插入到页面中
            var weibo = form.weibo;
            var username = form.user;
            var weiboCell = weiboTemplate(weibo, username,'')
            insertWeibo(weiboCell)
            input.value = ''
        })
    })
};

var bindEventWeiboDelete = function() {
    var weiboList = e('#id-weibo-list');
    // 事件响应函数会传入一个参数 就是事件本身
    weiboList.addEventListener('click', function(event) {
    log(event);
    // 我们可以通过 event.target 来得到被点击的对象
    var self = event.target;
    log('被点击的元素', self);
    log(self.classList);
    if (self.classList.contains('weibo-delete')) {
        log('点到了删除按钮');
        weiboId = self.parentElement.dataset['id'];
        apiWeiboDelete(weiboId, function(d) {
            log('apiWeiboDelete', d.message);
            // 删除 self 的父节点
            // self.parentElement.remove()
            weiboCell = self.closest('.weibo-cell');
            weiboCell.remove();
            alert(d.message)
        })
    } else {
        log('点到了 weibo cell')
    }
})};

var bindEventWeiboEdit = function() {
    var weiboList = e('#id-weibo-list');
    // 事件响应函数会传入一个参数 就是事件本身
    weiboList.addEventListener('click', function(event) {
    log(event);
    // 我们可以通过 event.target 来得到被点击的对象
    var self = event.target;
    log('被点击的元素', self);
    log(self.classList);
    if (self.classList.contains('weibo-edit')) {
        log('点到了编辑按钮');
        weiboCell = self.closest('.weibo-cell');
        weiboId = weiboCell.dataset['id'];
        var weiboSpan = e('.weibo-content', weiboCell);
        var content = weiboSpan.innerText;
        // 插入编辑输入框
        insertUpdateForm(content, weiboCell)
    } else {
        log('点到了 weibo cell')
    }
})};

var bindEventWeiboUpdate = function() {
    var weiboList = e('#id-weibo-list');
    // 事件响应函数会传入一个参数 就是事件本身
    weiboList.addEventListener('click', function(event) {
    log(event);
    // 我们可以通过 event.target 来得到被点击的对象
    var self = event.target;
    log('被点击的元素', self);
    log(self.classList);
    if (self.classList.contains('weibo-update')) {
        log('点到了更新按钮');
        weiboCell = self.closest('.weibo-cell');
        weiboId = weiboCell.dataset['id'];
        log('update weibo id', weiboId);
        input = e('.weibo-update-input', weiboCell);
        content = input.value;
        var form = {
            id: weiboId,
            content: content,
        };

        apiWeiboUpdate(form, function(weibo) {
            // 收到返回的数据, 插入到页面中
            log('apiweiboUpdate', weibo);
            if (weibo.message == '无权操作'){
                alert(weibo.message)
            } else {
                var weiboSpan = e('.weibo-content', weiboCell);
                weiboSpan.innerText = weibo.content;

                var updateForm = e('.weibo-update-form', weiboCell);
                updateForm.remove()
            }

        })
    } else {
        log('点到了 weibo cell')
    }
})};

var bindEvents = function() {
    bindEventWeiboAdd();
    bindEventWeiboDelete();
    bindEventWeiboEdit();
    bindEventWeiboUpdate();
    bindEventCommentAdd();
    bindEventCommentDelete()
    bindEventCommentEdit()
    bindEventCommentUpdate()
};

var __main = function() {
    bindEvents();
    loadWeibos()
};

__main();
