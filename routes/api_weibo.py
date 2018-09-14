from utils import log
from routes import json_response, current_user
from models.weibo import Weibo
from models.comment import Comment
from models.user import User


# 本文件只返回 json 格式的数据
# 而不是 html 格式的数据
def all(request):
    weibos = Weibo.all_json()
    comments = Comment.all_json()
    weibo_all = []
    for w in weibos:
        dvyyweibo = {}
        dvyyweibo['weibo'] = w
        list = []
        u = User.find_by(id=w['user_id'])
        dvyyweibo['username'] = u.username
        for c in comments:
            if w['id'] == c['weibo_id']:
                list.append(c)
        dvyyweibo['comment'] = list
        log('w_c', dvyyweibo)
        weibo_all.append(dvyyweibo)
        log('qrbuweibo', weibo_all)

    form = {
        'weibo_comment': weibo_all,
    }
    log('xnzidm', form)
    return json_response(form)


def add(request):
    # 得到浏览器发送的表单, 浏览器用 ajax 发送 json 格式的数据过来
    # 所以这里我们用新增加的 json 函数来获取格式化后的 json 数据
    form = request.json()
    # 创建一个 weibo
    u = current_user(request)
    t = Weibo.add(form, u.id)
    form = {
        'weibo': t.json(),
        'user': u.username
    }
    log('xnzidm1', form)
    # 把创建好的 WEIBO 返回给浏览器
    return json_response(form)


def delete(request):
    log('執行刪除函數')
    weibo_id = int(request.query['id'])
    Weibo.delete(weibo_id)
    c = Comment.find_all(weibo_id=weibo_id)
    del c
    d = dict(
        message="成功删除 weibo"
    )
    return json_response(d)


def update(request):
    """
    用于增加新 weibo 的路由函数
    """
    form = request.json()
    log('api weibo update form', form)
    t = Weibo.update(**form)
    return json_response(t.json())


def weibo_owner_required(route_function):
    """
    这个函数看起来非常绕，所以你不懂也没关系
    就直接拿来复制粘贴就好了
    """

    def f(request):
        log('weibo_owner_required')
        u = current_user(request)
        if u.is_guest():
            log('游客用户')
            d = dict(
                message="权限不足，请登录后访问weibo"
            )
            return json_response(d)
        else:
            log('登录用户', route_function)
            return route_function(request)

    return f


def weibo_update_required(route_function):
    """
    这个函数看起来非常绕，所以你不懂也没关系
    就直接拿来复制粘贴就好了
    """

    def f(request):
        log('weibo_update_required')
        u = current_user(request)
        weibo = request.json()
        w = Weibo.find_by(id=int(weibo['id']))
        if u.id != w.user_id:
            d = dict(
                message="无权操作"
            )
            return json_response(d)
        else:
            log('weibo更新', route_function)
            return route_function(request)

    return f


def route_dict():
    d = {
        '/api/weibo/all': weibo_owner_required(all),
        '/api/weibo/add': add,
        '/api/weibo/delete': delete,
        '/api/weibo/update': weibo_update_required(update),
    }
    return d
