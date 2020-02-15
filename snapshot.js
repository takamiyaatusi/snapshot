// スタックのようにスナップショットで履歴を管理するオブジェクト。保存するdataの中身はなんでもいい
function Snapshot(def){
	this.data = [];
	this.idx = 0;
	this.front = 0;
	this.default = def;
	this.data[this.idx] = this.default;
}
Snapshot.prototype = {
	// 現在のスナップショットを返す
	getCurrent: function(){
		var current = this.default;
		if (!this.isEmpty()) {
			current = this.data[this.idx];
		}
		return current;
	},
	// 現在のスナップショットを上書きする
	overwrite: function(v){
		this.data[this.idx] = v;
	},
	// スナップショットを追加（frontはidxの位置まで巻き戻す）
	add: function(v){
		if (this.diff(v)) {
			this.idx += 1;
			this.front = this.idx;
			this.data[this.idx] = v;
		}
	},
	// 一つ前に履歴を戻す
	backward: function(){
		var current = this.default;
		if (this.canBackward()) {
			this.idx -= 1;
			current = this.data[this.idx];
		}
		return current;
	},
	// 1つ履歴を進める
	forward: function(){
		var current = this.default;
		if (this.canForward()) {
			this.idx += 1;
			current = this.data[this.idx];
		}
		return current;
	},
	// 履歴があるか
	isEmpty: function(){
		return (this.idx === 0);
	},
	// 後に戻れるか
	canBackward: function(){
		return (this.idx > 0);
	},
	// 前に進めるか
	canForward: function(){
		return (this.idx < this.front);
	},
	// 現在の値と異なる値か？
	diff: function(v){
		var current = this.getCurrent();
		if (current.length !== v.length) {
			return true;
		}
		// dataに記録する値の内容によって、ここを書き換えると良い
		for (var i = 0; i < current.length; i++) {
			if (undefined === v[i] || current[i] !== v[i]) {
				return true;
			}
		}
		return false;
	},
};

$(function(){
	// 初期値
	var S = new Snapshot([]);
	S.add(toArray($(this).val()));
	// eventlistener
	// 履歴の保存
	$("[name='snapshot_target']").on('keydown', function(e, triggered){
		// イベントを手動triggerした時の追加パラメータを第二引数triggerdで受け取る
		if (e.keyCode == 13 || (undefined !== triggered && triggered.keyCode == 13)) {
			// Enterのタイミングで履歴追加
			S.add(toArray($(this).val()));
		}
		changeBtnState(S);
	});
	// undo
	$(".backward_btn").on('click', function(){
		// 1回確定させる
		$("[name='snapshot_target']").first().trigger('keydown', {keyCode: 13});
		$("[name='snapshot_target']").val(toStr(S.backward()));
		changeBtnState(S);
	});
	// redo
	$(".forward_btn").on('click', function(){
		$("[name='snapshot_target']").val(toStr(S.forward()));
		changeBtnState(S);
	});
});

function toArray(str){
	return str.split("\n").filter(function(v){
		return (v !== "")
	});
}
function toStr(array){
	return array.join("\n");
}

function changeBtnState(S){
	if (S.canBackward()) {
		$(".backward_btn").attr('disabled', false);
	}else{
		$(".backward_btn").attr('disabled', true);
	}
	if (S.canForward()) {
		$(".forward_btn").attr('disabled', false);
	}else{
		$(".forward_btn").attr('disabled', true);
	}
}
