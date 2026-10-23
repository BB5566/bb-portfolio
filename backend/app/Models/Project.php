<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'category_id', 'title', 'cover_image_url', 'preview_media_url',
        'description', 'technologies', 'features', 'project_link', 'github_link', 'sort_order', 'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'technologies' => 'array',
        'features' => 'array',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function tags()
    {
        return $this->belongsToMany(
            Tag::class,
            'project_tag_map',
            'project_id',
            'tag_id'
        );
    }

    public function galleries()
    {
        return $this->hasMany(ProjectGallery::class);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
