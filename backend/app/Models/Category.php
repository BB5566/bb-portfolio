<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    public $timestamps = false;

    protected $fillable = ['name', 'slug', 'description'];

    // 移除 $appends 以避免 N+1 查詢問題
    // 改為在控制器中使用 withCount('projects')

    public function projects()
    {
        return $this->hasMany(Project::class);
    }
}
