import React from 'react';
import { ArrowLeft } from 'lucide-react';

import { useNavigate } from 'react-router-dom';


const PreviousPage: React.FC = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
        // navigate('/specific-route')
    };

    return (
        <button
            onClick={goBack}
            className="py-3 px-6 rounded-lg border  flex items-center gap-2 text-sm text-gray-300 bg-gray-800/50 border-gray-800/50 hover:border-amber-500 hover:text-amber-500 mb-6"
        >
            <ArrowLeft className='w-5 h-5' /> Back
        </button>
    );
};

export default PreviousPage;