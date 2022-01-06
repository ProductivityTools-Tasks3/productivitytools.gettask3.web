import React from 'react'
import { useEffect, useState } from 'react';
import apiService from '../../services/apiService'

export default function DateCheck() {

    const [date, setDate] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const date = await apiService.getDate();
            setDate(date);
        }
        fetchData();
    }, [])

    return (
        <span>2.Date time returned from GetTask3 API: {date ? date : `server hasn't responded yet`}</span>
    )
}