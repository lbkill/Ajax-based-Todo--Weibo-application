from utils import log
from routes import json_response, current_user
from models.weibo import Weibo
from models.comment import Comment


# 本文件只返回 json 格式的数据
# 而不是 html 格式的数据


def add(request):
    # 得到浏览器发送的表单, 浏览器用 ajax 发送 json 格式的数据过来
    # 所以这里我们用新增加的 json 函数来获取格式化后的 json 数据
    form = request.json()
    # 创建一个 comment
    u = current_user(request)
    t = Comment.add(form, u.id)
    # 把创建好的 comment 返回给浏览器
    return json_response(t.json())


def delete(request):
    log('執行刪除函數')
    comment_id = int(request.query['id'])
    Comment.delete(comment_id)
    d = dict(
        message="成功删除 comment"
    )
    return json_response(d)


def update(request):
    """
    用于更新 comment 的路由函数
    """
    form = request.json()
    log('api comment update form', form)
    t = Comment.update(**form)
    return json_response(t.json())


def comment_owner_required(route_function):
    """
    这个函数看起来非常绕，所以你不懂也没关系
    就直接拿来复制粘贴就好了
    """

    def f(request):
        log('comment_owner_required')
        u = current_user(request)
        comment = request.json()
        w = Weibo.find_by(id=int(comment['weibo_id']))
        c = Comment.find_by(id=int(comment['id']))
        if u.id != w.user_id and u.id != c.user_id:
            d = dict(
                message="无权操作"
            )
            return json_response(d)
        else:
            log('评论更新', route_function)
            return route_function(request)

    return f


def route_dict():
    d = {
        '/api/comment/add': add,
        '/api/comment/delete': delete,
        '/api/comment/update': comment_owner_required(update),
    }
    return d
