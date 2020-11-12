import _ from 'lodash'
import { Entity, Column, ObjectIdColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { bcryptCompareAsync, bcryptHashAsync } from '../libraries/crypto'
import { UserPublic } from '../interfaces/user.interfaces'

@Entity()
export class User {
    /*
        // Note: I use shortid to generate ids for the primary columns
        // in other databases like postgres, you can use
        // @PrimaryColumn() with shortid 
        // or @PrimaryGeneratedColumn('uuid') to let the db generate the ids etc

        // example, to use shortid with postgres:
        @PrimaryColumn()
        _id: string // Note: primary key can be anything e.g. id, userId etc
    */
    
    // mongo (which I'm using)
    @ObjectIdColumn()
    _id!: string // Note: primary key MUST BE '_id' with the underscore

    @Column({ length: 80 })
    name!: string

    @Column({ length: 100 })
    email!: string

    @Column('text')
    password?: string

    @Column()
    dob!: Date

    @Column()
    address!: string

    @Column()
    description!: string

    @Column()
    refreshToken?: string

    @CreateDateColumn({ type: 'timestamp' })
    createdAt?: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt?: Date

    async hashPassword(): Promise<void> {
        if (this.password) this.password = await bcryptHashAsync(this.password, 8)
    }

    async checkIfUnencryptedPasswordIsValid(unencryptedPassword: string): Promise<boolean> {
        return bcryptCompareAsync(unencryptedPassword, this.password || '')
    }

    /**
     * Hides sensitive fields like password, refreshToken 
     * 
     * @returns {UserPublic} the user object but stripped of sensitive fields
     */
    public(): UserPublic {
        return _.omit({ id: this._id, ...this }, ['_id', 'password', 'refreshToken'])
    }
}
