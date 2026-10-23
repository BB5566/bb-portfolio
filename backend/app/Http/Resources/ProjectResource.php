<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'project_link' => $this->project_link,
            'github_link' => $this->github_link,
            'cover_image' => $this->cover_image,
            'cover_image_url' => $this->cover_image ? asset('storage/'.$this->cover_image) : null,
            'technologies' => $this->technologies,
            'features' => $this->features,
            'is_published' => $this->is_published,
            'sort_order' => $this->sort_order,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ]),
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->map(fn ($tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
                'category' => $tag->category,
            ])),
            'galleries' => $this->whenLoaded('galleries', fn () => $this->galleries->map(fn ($g) => [
                'id' => $g->id,
                'image_path' => $g->image_path,
                'image_url' => asset('storage/'.$g->image_path),
                'sort_order' => $g->sort_order,
            ])),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
