import {Link} from 'react-router';

/** The Talent Bridge mark and name, linking home. */
export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 rounded-md">
      <span
        aria-hidden
        className="relative flex size-7 items-center justify-center rounded-lg bg-primary"
      >
        <span className="absolute inset-x-1.5 top-1/2 h-1 -translate-y-1/2 rounded-full bg-periwinkle" />
        <span className="absolute top-1.5 bottom-1.5 left-1.5 w-1 rounded-full bg-white" />
        <span className="absolute top-1.5 right-1.5 bottom-1.5 w-1 rounded-full bg-white" />
      </span>
      <span className="font-display text-[17px] font-extrabold">
        Talent Bridge
      </span>
    </Link>
  );
}
