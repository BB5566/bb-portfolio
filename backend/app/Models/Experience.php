<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'company',
        'position',
        'location',
        'start_date',
        'end_date',
        'is_current',
        'description',
        'achievements',
        'technologies',
        'sort_order',
        'is_visible',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_current' => 'boolean',
        'is_visible' => 'boolean',
        'achievements' => 'array',
        'technologies' => 'array',
    ];

    /**
     * Scope to get only visible experiences
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    /**
     * Scope to order by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')
            ->orderBy('start_date', 'desc');
    }

    /**
     * Get formatted date period
     */
    public function getDatePeriodAttribute()
    {
        $start = $this->start_date->format('Y年m月');
        $end = $this->is_current ? '現在' : $this->end_date->format('Y年m月');

        return "{$start} - {$end}";
    }
}
