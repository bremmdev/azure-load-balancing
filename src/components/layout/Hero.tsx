import Divider from "../ui/Divider";
import Logo from "@/assets/logo.svg";

export default function Hero() {
  return (
    <>
      <div className="text-white relative bg-primary-teal flex items-center flex-col space-y-12 px-4 py-8 md:mb-12">
        <div className="max-w-[75%] md:max-w-2xl space-y-8 md:space-y-12">
          <h1 className="text-4xl sm:text-6xl tracking-wide font-bold text-center leading-tight">
            Sharpen your mind with{" "}
            <span className="text-teal-200">brain games</span>
          </h1>
          <p className="text-lg md:text-xl font-medium text-center">
            Boost your memory and cognitive skills with our brain-training
            exercises designed to keep your mind sharp and active.
          </p>

        <img src={Logo} className="h-[30vw] w-[30vw] max-h-64 max-w-64 block mx-auto" alt="memcaydia hero" />

        </div>
        <Divider className="-bottom-2 sm:-bottom-3 lg:-bottom-8" />
      </div>
    </>
  );
}
