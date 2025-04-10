"use client"

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ParamProps } from '@/types/appNode';
import React, { useEffect, useId, useState } from 'react';

interface StringParamProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    description?: string;
}

function StringParam({ value, onChange, placeholder, label, description }: StringParamProps) {
    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
    );
}

export default StringParam;