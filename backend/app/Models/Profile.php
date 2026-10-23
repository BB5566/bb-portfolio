<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'display_name',
        'display_name_sub',
        'title',
        'subtitle',
        'role_texts',
        'bio',
        'email',
        'phone',
        'location',
        'avatar',
        'resume_url',
        'github',
        'linkedin',
        'twitter',
        'facebook',
        'instagram',
        'website',
        'skills',
        'years_experience',
        'projects_delivered',
        'hours_training',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'skills' => 'array',
        'role_texts' => 'array',
    ];

    /**
     * Get formatted skills by category
     *
     * @return array
     */
    public function getSkillsByCategoryAttribute()
    {
        return $this->skills ?? [];
    }

    /**
     * Get all social media links
     *
     * @return array
     */
    public function getSocialLinksAttribute()
    {
        return array_filter([
            'github' => $this->github,
            'linkedin' => $this->linkedin,
            'twitter' => $this->twitter,
            'facebook' => $this->facebook,
            'instagram' => $this->instagram,
            'website' => $this->website,
        ]);
    }
}
