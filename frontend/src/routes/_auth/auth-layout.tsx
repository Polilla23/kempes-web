function AuthLayout({
  children,
  title,
  description,
}: {
  children: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-svh w-full lg:flex-row flex-col">
      <div className="flex flex-col gap-4 p-6 md:p-10 items-center w-full lg:w-3/10">
        <div className="flex flex-col items-center w-full mt-2 gap-6 self-start">
          <a href="#" className="flex justify-center items-center gap-2 font-semibold text-3xl select-none">
            <div className="flex size-20 items-center justify-center rounded-md overflow-hidden">
              <img src="/images/1200.png" alt="KML Logo" className="h-full w-full object-contain pr-4" />
            </div>
            Kempes Master League
          </a>
        </div>
        <div className="w-full h-3/5 flex items-center justify-center mt-4">
          <div className="w-4/5">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold select-none">{title}</h1>
              <p className="text-muted-foreground text-sm text-balance select-none">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block lg:w-7/10">
        <video
          src="/Mario Kempes - Argentina 1978 - 6 goals.mp4"
          autoPlay
          loop
          muted
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] dark:grayscale"
        />
      </div>
    </div>
  )
}

export default AuthLayout
