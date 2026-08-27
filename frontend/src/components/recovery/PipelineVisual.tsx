import { motion } from 'framer-motion';
import { Radar, Brain, Waypoints, ShieldCheck } from 'lucide-react';

export function PipelineVisual() {
  return (
    <div className="py-6 px-4 bg-[#F9FAFB] border-t border-[#E4E7EC]">
      <motion.div 
        initial="hidden" animate="visible" 
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        className="flex items-center justify-between relative max-w-4xl mx-auto"
      >
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-[#D0D5DD] via-[#2B84EA] to-[#12B76A] -z-10 -translate-y-1/2" />
        
        {[
          { icon: Radar, title: 'Detect', desc: 'Event intercepted' },
          { icon: Brain, title: 'Diagnose', desc: 'Risk evaluated' },
          { icon: Waypoints, title: 'Decide', desc: 'Policy approved' },
          { icon: ShieldCheck, title: 'Recover', desc: 'Action executed' },
        ].map((item, i) => (
          <motion.div key={i} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col items-center gap-2 bg-[#F9FAFB] px-2 relative z-10">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E4E7EC] shadow-sm flex items-center justify-center text-[#2B84EA]">
              <item.icon size={18} />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-[#101828]">{item.title}</div>
              <div className="text-xs text-[#667085]">{item.desc}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
