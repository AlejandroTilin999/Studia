import React from 'react';
import { MessageCircle, Send } from 'lucide-react';

interface AssignmentCommentsProps {
    comments: string[];
    localComment: string;
    setLocalComment: (val: string) => void;
    onAddComment: (text: string) => void;
    strokeColor: string;
}

export default function AssignmentComments({
    comments,
    localComment,
    setLocalComment,
    onAddComment,
    strokeColor
}: AssignmentCommentsProps) {
    const handleSend = () => {
        if (!localComment.trim()) return;
        onAddComment(localComment);
        setLocalComment('');
    };

    return (
        <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
                <MessageCircle size={16} className="text-slate-500" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Foro de Mensajes Privados
                </h4>
            </div>

            <div className="space-y-3">
                {comments.length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium italic pl-1">
                        No hay comentarios en esta entrega. Puedes escribirle a tu docente.
                    </p>
                ) : (
                    comments.map((c, i) => (
                        <div 
                            key={i} 
                            className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 font-medium"
                        >
                            {c}
                        </div>
                    ))
                )}
            </div>

            <div className="flex items-center gap-2 pt-2">
                <input
                    type="text"
                    value={localComment}
                    onChange={(e) => setLocalComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Escribe un mensaje privado para tu profesor..."
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium placeholder:text-slate-400"
                />
                <button
                    onClick={handleSend}
                    style={{ backgroundColor: strokeColor }}
                    className="p-2.5 text-white rounded-xl hover:opacity-90 transition-all shrink-0 active:scale-95"
                >
                    <Send size={15} />
                </button>
            </div>
        </div>
    );
}
