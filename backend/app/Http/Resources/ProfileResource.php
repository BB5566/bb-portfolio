<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->name,
            'display_name' => $this->display_name,
            'display_name_sub' => $this->display_name_sub,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'bio' => $this->bio,
            'hero_intro' => $this->hero_intro,
            'hero_proof' => $this->hero_proof,
            'email' => $this->email,
            'phone' => $this->phone,
            'location' => $this->location,
            'avatar' => $this->avatar,
            'avatar_url' => $this->avatar ? asset('storage/'.$this->avatar) : null,
            'resume_url' => $this->resume_url,
            'github' => $this->github,
            'linkedin' => $this->linkedin,
            'twitter' => $this->twitter,
            'instagram' => $this->instagram,
            'website' => $this->website,
            'skills' => $this->skills,
            'role_texts' => $this->role_texts,
            'years_experience' => $this->years_experience,
            'projects_delivered' => $this->projects_delivered,
            'hours_training' => $this->hours_training,
            'highlights' => $this->highlights,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
        ];
    }
}
