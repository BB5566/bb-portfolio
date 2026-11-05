<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    public $timestamps = false;

    protected $fillable = ['name', 'category'];

    // 移除 $appends 以避免 N+1 查詢問題
    // 改為在控制器中使用 withCount('projects')

    public function projects()
    {
        return $this->belongsToMany(
            Project::class,
            'project_tag_map',
            'tag_id',
            'project_id'
        );
    }
}
