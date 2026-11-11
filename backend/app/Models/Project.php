<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Project extends Model
{
    protected $fillable = [
        'category_id', 'slug', 'title', 'cover_image_url', 'preview_media_url',
        'description', 'technologies', 'features', 'case_study', 'project_link', 'github_link', 'sort_order', 'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'technologies' => 'array',
        'features' => 'array',
        'case_study' => 'array',
    ];

    protected static function booted()
    {
        static::creating(function ($project) {
            if (empty($project->slug)) {
                $slug = Str::slug($project->title);
                $project->slug = $slug ?: 'project-'.Str::random(8);
            }
        });
    }

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
        return $this->hasMany(ProjectGallery::class)->orderBy('sort_order');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * 網址上的代稱可以是英文 slug（正式網址）或數字 id（舊連結）
     */
    public function scopeWhereKeyOrSlug($query, string $key)
    {
        return ctype_digit($key) ? $query->whereKey((int) $key) : $query->where('slug', $key);
    }
}
