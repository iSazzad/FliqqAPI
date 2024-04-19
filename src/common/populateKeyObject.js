
/**
 * User Table
 */
const UserTableKey = 'email lastname firstname profile_url login_type _id is_active roll_type email_verified is_active'
const UserReferrence = {
    key: UserTableKey,
    keys: {
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
    }
}

/**
 * Alphabet Table
 */
const AlphabetTableKey = 'alpha_character image_url color_code';
const AlphabetReferrence = {
    key: AlphabetTableKey,
    keys: {
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
    },
}

/**
 * Alphabet Words Table
 */
const AlphabetWordTableKey = 'alphabet image_url name';
const AlphabetWordsReferrence = {
    key: AlphabetWordTableKey,
    alphabet: {
        path: 'alphabet',
        select: AlphabetTableKey,
        populate: AlphabetReferrence.key
    },
    keys: {
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
    },
}


module.exports = {
    UserReferrence,
    AlphabetReferrence,
    AlphabetWordsReferrence
};