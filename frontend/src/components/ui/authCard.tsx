import { Card, CardContent, CardHeader, CardTitle } from './card'

const authCard = ({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) => {
  return (
    <div className="relative h-screen flex items-center justify-center p-4 w-full">
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/Football-Field-Fake-Grass.jpg"
          alt="football field background"
          className="w-full h-full object-cover blur-sm"
        />
        <div className="absolute inset-0 "></div>
      </div>
      <Card className="bgrelative z-10 backdrop-blur-sm shadow-2xl flex flex-col justify-center w-full max-w-md h-full sm:h-auto px-6">
        <CardHeader className="text-center pb-2">
          {/* Kempes Logo acá */}
          <img src="/images/1200.png" alt="Kempes Master League Logo" className="h-12 w-12 mx-auto mb-2" />
          <CardTitle className="font-bold text-3xl select-none">Kempes Master League</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

export default authCard
