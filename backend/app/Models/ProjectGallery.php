<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectGallery extends Model
{
    public $timestamps = false;

    protected $fillable = ['project_id', 'image_url', 'caption', 'sort_order'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
