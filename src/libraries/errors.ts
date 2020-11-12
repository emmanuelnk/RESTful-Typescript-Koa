export class BadRequest extends Error {
    status = 400
    name = 'BadRequest'
    expose = false
}

export class Unauthorized extends Error {
    status = 401
    name = 'Unauthorized'
    expose = false
}

export class Forbidden extends Error {
    status = 403
    name = 'Forbidden'
    expose = false
}

export class NotFound extends Error {
    status = 404
    name = 'NotFound'
    expose = false
}

export class Conflict extends Error {
    status = 409
    name = 'Conflict'
    expose = false
}

export class InternalServerError extends Error {
    status = 500
    name = 'InternalServerError'
    expose = false
}

export class InvalidUserAccount extends Unauthorized {
    name = 'InvalidUserAccount'
    constructor() {
        super('Invalid user account')
    }
}

export class UserSessionExpired extends Unauthorized {
    name = 'UserSessionExpired'
    constructor() {
        super('User session expired')
    }
}

export class UserPermissionDenied extends Forbidden {
    name = 'UserPermissionDenied'
    constructor() {
        super('User permission denied')
    }
}

export class UserNotFound extends NotFound {
    name = 'UserNotFound'
    constructor() {
        super('User not found')
    }
}

export class UsersNotFound extends NotFound {
    name = 'UsersNotFound'
    constructor() {
        super('Users not found')
    }
}

export class UserAlreadyExists extends Conflict {
    name = 'UserAlreadyExists'
    constructor() {
        super('User already exists')
    }
}

export class UserLinkNotFound extends NotFound {
    name = 'UserLinkNotFound'
    constructor() {
        super('User link not found')
    }
}

export class UserLinkAlreadyExists extends Conflict {
    name = 'UserLinkAlreadyExists'
    constructor() {
        super('User link already exists')
    }
}

export class InvalidUserLink extends BadRequest {
    name = 'InvalidUserLink'
    constructor() {
        super('Invalid user link')
    }
}

export class RequestValidationErrors extends BadRequest {
    name = 'RequestValidationErrors'
    constructor(errorMessage: string) {
        super(`Request Validation Errors: ${errorMessage}`)
    }
}

export class MissingRequestParameters extends BadRequest {
    name = 'MissingRequestParameters'
    constructor(errorMessage: string) {
        super(`Missing Request Parameters: ${errorMessage}`)
    }
}

export class InvalidUserPassword extends BadRequest {
    name = 'InvalidUserPassword'
    constructor(errorMessage: string) {
        super(`Invalid User Password: ${errorMessage}`)
    }
}

export class InvalidUserID extends BadRequest {
    name = 'InvalidUserID'
    constructor() {
        super('Invalid User ID')
    }
}

export class InvalidToken extends Forbidden {
    name = 'InvalidToken'
    constructor() {
        super('Invalid Token')
    }
}

export class RevokedToken extends Forbidden {
    name = 'RevokedToken'
    constructor() {
        super('Revoked Token')
    }
}

export class UserNotLoggedIn extends Unauthorized {
    name = 'UserNotLoggedIn'
    constructor() {
        super('User Not Logged In')
    }
}