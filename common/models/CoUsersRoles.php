<?php

namespace common\models;

use common\models\query\CoUsersRolesQuery;
use Yii;
use yii\db\ActiveQuery;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "co_users_roles".
 *
 * @property integer $user_role_id
 * @property integer $tenant_id
 * @property integer $user_id
 * @property integer $role_id
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 *
 * @property CoUser $user
 * @property CoRole $role
 * @property CoTenant $tenant
 */
class CoUsersRoles extends ActiveRecord {

    public $role_ids;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_users_roles';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['tenant_id', 'user_id', 'role_ids'], 'required', 'on' => 'roleassign'],
                [['tenant_id', 'user_id', 'role_id', 'created_by', 'modified_by'], 'integer'],
                [['created_at', 'modified_at', 'role_ids'], 'safe']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'user_role_id' => 'User Role ID',
            'tenant_id' => 'Organization',
            'user_id' => 'User',
            'role_id' => 'Role',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'role_ids' => 'Roles',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getUser() {
        return $this->hasOne(CoUser::className(), ['user_id' => 'user_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getRole() {
        return $this->hasOne(CoRole::className(), ['role_id' => 'role_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new CoUsersRolesQuery(get_called_class());
    }

    public static function getDb() {
        return Yii::$app->client;
    }

//    public function afterSave($insert, $changedAttributes) {
//        $user = CoUser::find()->where(['user_id' => $this->user_id])->one();
//        if ($insert)
//            $activity = 'User Role assigned Successfully (#' . $user->name . ' )';
//        else
//            $activity = 'User Role Updated Successfully (#' . $user->name . ' )';
//        CoAuditLog::insertAuditLog(CoUsersRoles::tableName(), $this->user_role_id, $activity);
//        return parent::afterSave($insert, $changedAttributes);
//    }

}
