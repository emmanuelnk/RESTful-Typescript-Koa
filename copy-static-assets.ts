import * as shell from 'shelljs'

shell.cp('-R', 'public/', 'dist/public/')
shell.cp('-R', 'src/routes/swagger-description.html', 'dist/routes/')
