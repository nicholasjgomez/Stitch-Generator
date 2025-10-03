import React from 'react';
import { Logo } from './Logo';

const AboutScreen: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-4xl mx-auto">
      <div className="flex flex-col items-center text-center">
        <Logo className="w-16 h-16 text-sky-500 mb-4" />
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Spend Less Time Planning, More Time Stitching</h2>
        <p className="text-lg text-slate-600">Our mission is to make creativity accessible to everyone.</p>
      </div>
      <div className="mt-8 text-slate-700 leading-relaxed space-y-4">
        <p>
          Have you ever seen a beautiful image and thought, "That would make an amazing cross-stitch project!" only to be stopped by the tedious process of creating a pattern? We have. That's why we created Cross-Stitch Genie.
        </p>
        <p>
          We're passionate crafters who believe that the joy of cross-stitching should be in the mindful act of stitching itself, not in the complex and often frustrating setup. We wanted a tool that was fast, simple, and intuitive—a way to bridge the gap between inspiration and creation in just a few clicks.
        </p>
        <p>
          Cross-Stitch Genie is our solution. It's a smart tool designed to instantly transform any image into a clean, easy-to-follow, single-color pattern. Whether you're a beginner looking for your first project or an experienced stitcher wanting to quickly mock up an idea, our Genie is here to grant your wish.
        </p>
        <p className="font-semibold text-slate-800 text-center pt-4">
          Happy Stitching!
        </p>
      </div>
    </div>
  );
};

export default AboutScreen;
